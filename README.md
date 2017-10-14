
<img src="https://i.imgur.com/Pj1VqQh.png" align="right"/>

# nonky

nonky is a way to display system information or any kind of information right on your desktop.
Inspired by Linux's conky it takes a different approch, a straight forward api exposes a lot of data, js libraries are doing the heavier calculations and finally, use HTML5 to customize the look and feel

![Screen](https://i.imgur.com/3Et0E1B.png)

# Downlod

Download the App from [here](https://github.com/0i0/nonky/wiki)

# Costumization (Building your own)

Custumization is my first priority!
To make your own nonky

- Download the app
- Open it
- Click on the pin icon
- select "Templates Direcory..."
- Create a new folder with the \<name of your template\>
- make the power house index.html, style.css, script.js
- creat your design - follow the examples
- send me a photo to your design and a link to your repo
- links to designs will be added on this page

# the API

# RESTFull API
There is a RESTFull API to get sistem information

    /api/cpus/:samplesNumber/:sampleTimeInMiliseconds

Provides CPU statistics, you can specify the number of samples and inerval between sampleing

    /api/smc/:key

Provides access to Apple's SMC subsystem information about tempatures and fans etc..

for information go [here](https://www.npmjs.com/package/smc)

    /api/mem

Provides memory information, this is currently using node's os functions, The data they retrieve might look wierd by the way it counts free memory (might be changed in the near future)

    /api/defaultnet

Provides information about the default network interface might be used to calculat bandwith and such

    /api/ps/:numOfPs/:sortColumn

Provides information about top processes, you can specify the number of processes it retrieves and and a sorting column 
Columns are (1)PID (2)CPU Usage (3)Memory usage (4)process name

    /api/crypto

Provides information about cryptocurrency rate from coinmarketcap.com

# Websockets

Websockets are used to provide events as they happen
Currently provides information to the currently played song either in iTunes or Spotify

to setup a listner follow the jquery example template

or

include the socket.io.js in the head tag like so

    <html>
      <head>
       <script src="/socket.io/socket.io.js"></script>
       ...

and then at the bottom'

    socket.on('playing', function(data){
      //do some stuff with the data when played
    })
    socket.on('paused', function(data){
      //do some stuff with the data when paused
    })


# Building from source

# Clone git Repo

    git clone https://github.com/0i0/nonky.git

# Open the Xcode project

    build

you might need to change some settings in the info.plist
if that happens please let me know and i will update this section

# Don't have a Mac?

You can still use nonky in the browser

    git clone https://github.com/0i0/nonky.git && cd nonky/nonkyserver

    npm install

    mkdir -p ~/Library/Application\ Support/nonky
    cp -a public ~/Library/Application\ Support/nonky

    node app.js

Open your browser and go to

    http://localhost:26498/templates/jquery/

# Tipping

If you enjoyed please consider tipping me @

Bitcoin 
	
	142jKB3e9uC8sSmssKtp5NtWScarZdYpuH

Ethereum

	0x8423b2cA48Bd9a734B4FE27A4E78f64e12131B79​
