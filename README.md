# Starter Next.js Simple

## About
This is a sample starter project template built with Next.js. Use this as a foundation to quickly bootstrap your Next.js applications with a clean, minimal setup.

## Make it your own
You will want a personal copy of this project in your own folder. We have a simple solution for this.

```bash
# replace my-project with your project name
npx make-mine https://github.com/bladnman/Spiralizer.git my-project
```

This will clone create a new folder `my-project` and copy the contents of this project into it. It will also remove the `.git` folder so you can start fresh and do a bit or renaming. [make-mine](https://www.npmjs.com/package/make-mine) can be used on any repo.


## Install and Run Development
To install and run the development server:

```bash
npm install
npm run dev
```
or similar

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Package Versioning
This starter is configured to always use the latest compatible versions of its dependencies. Here's how it works:

1. The `package.json` uses caret (^) versioning to allow minor and patch updates while preventing breaking changes
2. We intentionally don't track `package-lock.json` to ensure you get the latest compatible versions when you install
3. After initial install, you can run `npm run update-deps` to update all dependencies to their latest compatible versions

This approach ensures your project starts with up-to-date dependencies while maintaining stability through semantic versioning.

## References
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn](https://nextjs.org/learn)
- [Next.js GitHub Repository](https://github.com/vercel/next.js)
