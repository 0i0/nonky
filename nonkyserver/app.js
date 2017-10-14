var child_process = require('child_process')
var os            = require('os')
  , fs            = require('fs')
  , path            = require('path')
  , exec0         = child_process.exec
  , si            = require('systeminformation')
  , smc           = require('smc')
  , request       = require('request')
  , nowplaying    = require('nowplaying')
  , express       = require('express')
  , xml2js        = require('xml2js')

var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(express.static(process.env.HOME+'/Library/Application Support/nonky/public'))

app.get('/api/templates',function(req,res){
  var p = process.env.HOME+'/Library/Application Support/nonky/public/templates'
  files = fs.readdirSync(p)
  files = files.filter(function(file){
    return fs.statSync(path.join(p, file)).isDirectory()
  })
  res.json(files)
})

// returns a number of samples of os.cpus
app.get('/api/cpus/:samplesNumber/:sampleTime', function (req, res) {
  var samplesNumber = req.params.samplesNumber
    , sampleTime = req.params.sampleTime
    , samples = []
  samples.push(os.cpus())
  if (samplesNumber==1) {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(samples))
  }else{
    setTimeout(function getSample(){
      samples.push(os.cpus())
      samplesNumber--
      if (samplesNumber==1) {
        res.json(samples)
      }else{
        setTimeout(getSample,sampleTime)
      }
    },sampleTime)
  }
})

app.get('/api/smc/:key', function (req, res) {
  var key = req.params.key
  res.json(smc.get(key))
})

app.get('/api/mem', function (req, res) {
  res.json(
    {
      total:os.totalmem(),
      free:os.freemem()
    }
  )
})

app.get('/api/defaultnet', function (req, res) {
  si.networkInterfaceDefault(function(interface){
    si.networkStats(interface, function(data) {
      res.json(data)
    })
  })
})

app.get('/api/ps/:numOfPs/:sortColumn', function (req, res) {
  var numOfPs = req.params.numOfPs?Number(req.params.numOfPs):5
  var sortcolumn = req.params.sortColumn?Number(req.params.sortColumn):2
  exec0('ps -Ao pid,%cpu,%mem,comm |sort -nrk '+
        sortcolumn+
        ' | head -n '+numOfPs+' | awk \'{gsub("(.+/)","",$4);print "<"substr($4,1,13)"<" "," $1 "," $2 "," $3 ":" }\'',function(error, stdout, stderr) {
    if(stderr) return
    var str = stdout.replace(/:/g,'],[')
    str = str.replace(/</g,'"')
    str = '[['+str+']]'
    var ps =JSON.parse(str)
    ps.splice(ps.length-1,1)
    res.json(ps)
  })
})

app.get('/api/crypto', function (req, res) {
  request.get('https://api.coinmarketcap.com/v1/ticker/',{
    maxRedirects: 5
  },function(err,gres,body){
    if(err) return
    if(res.statusCode !== 200 ) return
    res.json(JSON.parse(body))
  })
})

io.on('connection', function(socket){
  nowplaying.on('playing', function (data) {
    var url = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=' + 
      data.artist+ '&album=' + data.album+ '&api_key=ee89018b7b81952407bb7f5903867958'
    request.get(url,{
      maxRedirects: 5
    },function(err,gres,body){
      xml2js.parseString(body,function(err,result){
        if(err) return
        data.coverartUrl = (result.lfm.$.status == 'ok')?result.lfm.album[0].image[2]._:''
        socket.broadcast.emit('playing', data)
      })
      
    })
  })
  nowplaying.on('paused', function (data) {
    socket.broadcast.emit('paused', data)
  })
  
})


http.listen(26498, function(){
  console.log('running on http://localhost:26498')
})