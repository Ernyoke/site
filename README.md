# ernyoke.github.io/site/
This is the source code for https://ernyoke.github.io/site/

## Build
`npm run build`

## Development
`npm start`

## Test
`npm test`

## Deploy on GitHub
`npm run deploy`

## Building and running Docker image
```
npm run build
docker image build -t site
docker container run -p 8080:8080 -d  --name site site
```

## Credits
This projects was inspired from Shelley Vohr's personal website. The original source code can be found here: https://github.com/codebytere/codebytere.github.io
