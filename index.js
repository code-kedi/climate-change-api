const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const newspapers = [
  {
    name: 'guardian',
    address: 'https://www.theguardian.com/environment/climate-crisis',
    base: ''
  },
  {
    name: 'telegraph',
    address: 'https://www.telegraph.co.uk/climate-change',
    base: 'https://www.telegraph.co.uk'
  },
  {
    name: 'bbc',
    address: 'https://www.bbc.co.uk/news/science_and_environment',
    base: 'https://www.bbc.co.uk'
  },
  {
    name: 'nyt',
    address: 'https://www.nytimes.com/international/section/climate',
    base: 'https://www.nytimes.com'
  }
];

const articles = [];

newspapers.forEach(newspaper => {
  axios.get(newspaper.address)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);

      $('a:contains("climate")', html).each(function () {
        // saving the text of the a tag inside a variable called title
        const title = $(this).text();
        // saving the value of the href attribute inside a variable called url
        const url = $(this).attr('href');

        articles.push({
          title: title.trim(),
          url: newspaper.base + url,
          source: newspaper.name
        });
      });

    })
})

app.get('/', (req,res) => {
  res.json('Welcome to my Climate Change News API');
})

app.get('/news', (req,res) => {
  res.json(articles);
})

app.get('/news/:newspaperId', (req,res) => {
  const newspaperId = req.params.newspaperId;

  // filter the newspapers array
  const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
  const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base

  axios.get(newspaperAddress)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html)
      const specificArticles = []

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr('href');
        specificArticles.push({
          title: title.trim(),
          url: newspaperBase + url,
          source: newspaperId
        })
      })
      res.json(specificArticles);
    }).catch(err => console.log(err));
})

// app.get('/news', (req,res) => {
//   axios
//     .get('https://www.theguardian.com/environment/climate-crisis')
//     .then((response) => {
//       const html = response.data;
//       const $ = cheerio.load(html);

//       $('a:contains("climate")', html).each(function () {
//         const title = $(this).text();
//         const url = $(this).attr('href');

//         articles.push({
//           title,
//           url
//         });
//       });
//       res.json(articles);
//     }).catch((err) => console.log(err));
// });

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
