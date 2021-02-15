const puppeteer = require('puppeteer');
const express = require('express');
const { env } = require('process');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    console.log(req.query);
    const start_time = process.hrtime();
    res.set('Content-Type', 'text/html');
    res.write(`<!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css" integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4" crossorigin="anonymous">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js" integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm" crossorigin="anonymous"></script>
  </body>
    <title>NETWORK LOGGER</title>
    <style>
    body{
     line-height: 1.0;
    }
    td{
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
        max-width:700px;
        font-size:12px;
      }
    .ws{
        white-space:normal;
        overflow-wrap: break-word;
    }
      </style>
    </head>
    <body><h1>SIMPLE NETWORK LOGGER!</h1>
    <form action="/" method="GET">
  <div class="form-row align-items-center">
    <div class="col-auto">
      <div class="input-group mb-2">
        <div class="input-group-prepend">
          <div class="input-group-text">https://</div>
        </div>
        <input name="url" type="text" class="form-control" id="inlineFormInputGroup" placeholder="www.example.com">
      </div>
    </div>

    <div class="col-auto">
      <button type="submit" class="btn btn-primary mb-2">Submit</button>
    </div>
  </div>
</form>
    <input class="form-control" id="myInput" type="text" placeholder="Search Network Requests...">
    <div class="table-responsive-sm"><table id="myTable" class="table table-sm table-bordered table-hover">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">URL</th>
      <th scope="col">Content</th>
      <th scope="col">Resource</th>
      <th scope="col">Status</th>
    </tr>
  </thead><tbody>`);
    (async () => {

        let i = 1;
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const page = await browser.newPage();

        page.on('response', response => {

            res.write(`<tr id=${i} ${response.url().includes('google-analytics') ?
               `class="table-info"`: response.status() >= 400 && response.status() <= 599 ?
               `class="table-danger"`: ''}>
            <td scope="row"><samp>${i}</samp></td>
            <td><samp>${response.url()}</samp></td>
            <td><samp>${response.headers()['content-type']}</samp></td>
            <td><samp>${response.request().resourceType()}</samp></td>
            <td><samp>${response.status()}</samp></td>
            </tr>`);
            i++;
        });
        var url = req.query.url||'https://infotrust.com';
        url = /http/i.test(url)?url:'https://'+url;
        await page.goto(url).catch((e) => { console.error(e); res.write(e.message) });
        const diff = process.hrtime(start_time);
        await browser.close();
        res.write('</tbody></table></div><script>$("td").click(function(){$(this).toggleClass("ws")});$(document).ready(function(){$("#myInput").on("keyup", function(){var value = $(this).val().toLowerCase();$("#myTable tr").filter(function() {$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)});});});</script></body></html>');
        res.end(`<p>DONE! ${Number(diff.join('.')).toFixed(2)}ms</p>`);
        console.log(diff);
    })();

})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
