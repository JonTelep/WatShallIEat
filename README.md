# Welcome to Wat Shall I Eat
This is a project to help people decide what to eat around them, and how they want to order. If that's ordering from a food delivery service, driving or walking. The estimated time will be available.

# Collaboration
I expect anyone that was invited to this project to have a role one way or another. In order to start working on the project you will need to create your own branch and pull the code down locally. Once you've done that reach out to me in order to add the `.env` file which houses the API keys needed for this project. I have left the standard README that React gives below in case you need to know how to run the project locally.

# Steps to help with project
Create a folder to house the project on your local machine

# How to run the project
To run next.js locally you can use the following commands:
### `npm install`
### `npm run dev`

# How to contribute
To contribute to the project you will need to create a branch and make your changes there. Once you have made your changes and tested them you can open a pull request. I will review the code and merge it if it is approved.

# How to build the project
To build the project you can use the following command:
### `npm run build`

# How to deploy the project
Vercel builds this Next.js app with `npm run build`. There is no deploy script.

watshallieat.com and www.watshallieat.com currently answer with Vercel `DEPLOYMENT_NOT_FOUND`. DNS already points at Vercel, but no deployment is bound to the domain. This repo is not linked to a Vercel project on the team this workspace can see, and that team cannot read the domain.

After this pull request is merged:

1. Import `JonTelep/WatShallIEat` into the Vercel account that should own the domain.
2. Set production environment variables: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `RESEND_API_KEY`, `RESEND_SEGMENT_ID`, and `NEWSLETTER_SECRET`. See `.env.example`. Create a Resend segment for weekly meal ideas and, if Resend requires it, a string contact property named `watshallieat_status`.
3. Do not add a mail send. Signup only stores a contact. Welcome mail is not implemented.
4. Add `watshallieat.com` and `www.watshallieat.com` to the production deployment. `www` redirects to the apex host.
5. If the domain is still attached to another Vercel account, remove it there first so this project can claim it.

The meal pages, sitemap, and robots file do not need the Google Maps key. Nearby search does.
