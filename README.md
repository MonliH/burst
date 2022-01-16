# Burst

> Burst out of your filter bubble

Burst is a chrome extension that uses deep learning to scan through the tweets you see and warn you about and overly emotional or hateful ones, so you know which posts to take with a grain of salt. It shows you the emotion and strength of the emotion of each tweet. Also, it shows tweets as misleading if they contain outdated information or information taken out of context. 

Submitted to [DeltaHacks 8](https://deltahacks8.devpost.com/).

## Building the extention from source

```bash
git clone https://github.com/MonliH/burst.git
cd burst
npm install
NODE_ENV=production npm run build
```

Now, there should be the (unpacked) extention in the `build` directory. To install it:

1. Go to `chrome://extensions`
2. Check `Developer Mode`
3. Click on `Load unpacked extension`
4. Select the `build` directory

## Running the backend server locally

Clone the repo, then:
```bash
cd backend
python3 -m pip install -r requirements.txt uvicorn[standard]
uvicorn main:app
```
