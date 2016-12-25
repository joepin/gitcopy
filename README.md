# GitCopy

GitCopy is a simple script that hits GA's enterprise GitHub server and clones all of a user's repos to their local machines.

## Usage

In order to use this script, clone this repo and run `npm i`.

You will need an OAuth token with repo access on your account, which can be generated from your account's settings page. You want to create a Personal Access Token for your account, and input it when the script requests it.

Here's how you'd do it:

1. Navigate to [your Git GA's settings page](https://git.generalassemb.ly/settings/profile)
2. Select `Personal Access Tokens` from the menu on the left side
3. Click `Generate New Token` and enter your password again
4. Give your token a description and check off the box labeled `repo` to grant access to the repo scope
5. Click `Generate Token`, and copy the token from the confirmation page

Once you have your token, `cd` into this script's directory and run `node main.js`, pasting the token when the script asks for it.

## TODO

It would be nice to have this script automatically push the repos up to a public account, and it would also be nice for it to generate an OAuth token for the user. To accomplish both, we can use [this package](https://www.npmjs.com/package/github) in the future.
