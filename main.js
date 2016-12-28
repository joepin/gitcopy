// requires
const path   = require('path');
const cmd    = require('node-cmd');
const prompt = require('prompt');
const fetch  = require('node-fetch');
const fs     = require('fs');
const colors = require('colors/safe');

// global variables
let doAnother = false;
// change the host of this url to whichever host your GH account is on
let base = `https://git.generalassemb.ly/api/v3/user/repos?per_page=100`;
// token will be populated after the prompts run
let token = '';
// for paginated requests; simpler than having to parse the link header
let page = 1;
// empty array to hold all the repo data
let raw = [];

// prompts the user for their OAuth token which they generated on their own accounts and saves it in the global token var.
// doPrompts calls doFetch on the base URL when it completes
function doPrompts() {
  prompt.message = '',
  prompt.delimeter = colors.white(":"),

  prompt.start();

  const props = [
    {
      name: "origin_token",
      message: colors.white("Please enter your origin GitHub's OAuth token"),
    }
  ]

  prompt.get(props, (err, result) => {
    console.log(result)
    token = result.origin_token;
    doFetch(base);
  });
}

// helper method to check the link header of the response from GH server to see if there is a next link
function checkIfNext(res) {
  const links = res.headers._headers.link;
  const hasNext = links[0].includes('rel="next"');
  return hasNext;
}

// fetches the user's repos and calls doClone on them
function doFetch(url) {
  // set headers with token from the global variable
  let headers = {
    'Content-Type': 'application/json',
    'Authorization': `token ${token}`,
  };
  // set the control flag to false
  doAnother = false;
  // fetch the passed in url with the global headers object
  fetch(url, {
    headers: headers,
    method: 'GET',
  })
  .then(r => {
    // call our helper method from above: if there is a next page
    if(checkIfNext(r)) {
      // increment the page counter
      page++;
      // set the control flag to true; indicating we want to fetch again on the next page
      doAnother = true;
    }
    // parse the response as a JSON object
    return r.json();
  })
  .then(data => {
    // data holds all the raw data of the user's repos from the curret fetch call
    // merge the raw array with the new data
    raw = raw.concat(data);
    // if we have a next page
    if(doAnother) {
      // generate the url of the next call by adding the page parameter to the query string
      // TODO: utilize the link header for the next url call
      let nextURL = base.includes('?') ? `${base}&page=${page}` : `${base}?page=${page}`;
      // recursively call this function with the next page url until we do a fetch and the control flag is still false
      doFetch(nextURL);
    } else {
      // the control flag tells us that we finished running through all the pages, so move on to the next step: clone the repos
      doClone(raw);
    };
  })
  .catch(console.log);
}

// builds out a bash script from the raw repos data received from all the fetch calls
function doClone(repos) {
  // checks if clones directory exists and creates it if not
  if (!fs.existsSync(path.resolve(__dirname, 'clones'))) fs.mkdirSync(path.resolve(__dirname, 'clones'));
  // instantiate string that will be acted upon and written to our command script
  // NOTE: we're expecting a directory called 'clones' to exist in the current working directory
  let output = 'cd clones/\n';
  repos.forEach((repo) => {
    // add this line to the output string for when a user calls the command script from the terminal
    output += `echo cloning ${repo.name} into ${path.resolve(__dirname, 'clones')}/${repo.name}\n`;
    // add a line to the output that includes the clone url
    output += `git clone ${repo.clone_url}\n`;
  });
  // now that we have a string of git clone commands we call a little helper method to write it to a file for the future
  generateCloneScript(output);
  // print a nice little message to the user
  console.log(`Cloning all ${repos.length} repos from your account into ${path.resolve(__dirname, 'clones')}`);
  console.log(`This may take a while...`);
  // run that string of commands now
  cmd.run(output);
}

function generateCloneScript(commands) {
  fs.writeFile(path.resolve(__dirname, './commands.sh'), commands, (err) => {if(err) console.log(err)});
}

// run the whole thing
doPrompts();



