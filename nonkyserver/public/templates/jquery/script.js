requirejs.config({
  baseUrl: '/js/lib',
  paths: {
    jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min',
    CPU: 'CPU',
    canvasRings: 'canvas-rings',
    makeTable: 'maketable'
  }
})
define(['jquery','CPU','canvasRings','makeTable'],function ($,CPU,drawRing,makeTable) {
  // Get CPU Usage Data the api is /api/cpus/numberOfSamples/SampleingInterval
  function getCPUs(){
    $.ajax({
      url: '/api/cpus/4/500?_=' + new Date().getTime()
    }).done(function(data) {
      var samples = CPU.cacluateAvgUse(data)    
      window.ctx.clearRect(50-55, 50-55, 55*2, 55*2)
      for (var core = samples.length - 1; core >= 0; core--) {
        drawRing(window.ctx,50,50,25+core*7,6,30,330,false,samples[core].avg,0,0.5,200,0.5)
      }
    }).always(function(){
      setTimeout(getCPUs,window.refreshRate)
    })
  }  
  // CPU Tempture from smc (for more data check https://www.npmjs.com/package/smc)
  function getCPUTemp(){
    $.ajax({
      url: '/api/smc/TC0P?_=' + new Date().getTime()
    }).done(function(data) {
      var cputemp = parseInt(data)
      $('#cputemp-data').html( cputemp +'°')
    }).always(function(){
      setTimeout(getCPUTemp,window.refreshRate) 
    })
  }
  // Get Memory data
  function getMem(){
    $.ajax({
      url: '/api/mem?_=' + new Date().getTime(),
    }).done(function(data) {
      var mem = data
      var used = Math.round((mem.total-mem.free)/1024/1024/1024*100)/100
      var total = Math.round((mem.total)/1024/1024/1024*100)/100
      $('#mem-data').html( used+ 'G/' +total +'G' )
      window.ctx.clearRect(150-30, 95-30, 30*2, 30*2)
      drawRing(window.ctx,150,95,30,12,90,180,true,used/total,0,0.5,200,0.5)
    }).always(function(err){
      setTimeout(getMem,window.refreshRate) 
    })
  }
  // Get Network Data from default Interface
  function getNet(){
    $.ajax({
      url: '/api/defaultnet?_=' + new Date().getTime(),
    }).done(function(data) {
      // Uncomment the following line to see the whole data returned from the api
      // console.log(data)
      var upKB = Math.round(data.tx_sec/1024*100)/100
      var dnKB = Math.round(data.rx_sec/1024*100)/100
      $('#netup-data').html(upKB + 'KB')
      $('#netdn-data').html(dnKB + 'KB')
      if (window.upChartData.datasets.length > 0) {
        window.upChartData.datasets[0].data.push(upKB)
        window.upChartData.datasets[0].data.splice(0,1)
        window.upBar.update()
      }
      if (window.dnChartData.datasets.length > 0) {
        window.dnChartData.datasets[0].data.push(-dnKB)
        window.dnChartData.datasets[0].data.splice(0,1)
        window.dnBar.update()
      }
    }).always(function(){
      setTimeout(getNet,window.refreshRate) 
    })
  }
  // get Top processes by sorted by the second column (cpu useage)
  function getProcesses(){
    $.ajax({
      url: '/api/ps/5/2?_=' + new Date().getTime(),
    }).done(function(data) {
      $('#ps-tbody').html('')
      makeTable(data,'ps-tbody')
    }).always(function(){
      setTimeout(getProcesses,window.refreshRate) 
    })
  }
  // get Criptocurrency qoutes
  function getCrypto(){
    $.ajax({
      url: '/api/crypto?_=?_=' + new Date().getTime(),
    }).done(function(data) {
      // Uncomment the following line to see the whole data returned from the api
      // console.log(data)
      data.splice(5,data.length-5)
      var qoutes = data
      for (var i = 0; i < 5; i++) {
        qoutes[i] = [qoutes[i].id,qoutes[i].price_usd]
      }
      $('#crypto-body').html('')
      makeTable(data,'crypto-body')
    }).always(function(){
      setTimeout(getCrypto,window.refreshRate) 
    })
  }
  $( document ).ready(function(){
    window.timers = {}
    window.refreshRate = 2000
    var $c = $('#myCanvas')
    // Canvas for cpus
    window.ctx = $c[0].getContext('2d')
    // Setup Now playing events (itunes and spotify)
    var socket = window.io()
    socket.on('playing', function(data){
      $('#now-playing').html(data.artist+ ' - ' + data.name)
      $('#now-playing-coverart').css('background-image','url("'+data.coverartUrl+'")')
    })
    socket.on('paused', function(){
      $('#now-playing').html('')
    })
    var ctxup = $('#up-chart')[0].getContext('2d')
    var ctxdn = $('#dn-chart')[0].getContext('2d')
    // Defenition for Bandwidth Charts 
    
    window.upChartData = {
      labels: ['', '', '', '', '', '', '', '', '', '','', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        backgroundColor: '#ccc',
        borderWidth: 0,
        data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      }]
  
    }
    window.dnChartData = {
      labels: ['', '', '', '', '', '', '', '', '', '','', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        backgroundColor: '#ccc',
        borderWidth: 0,
        data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      }]
    }
    window.upBar = new window.Chart(ctxup, {
      type: 'bar',
      data: window.upChartData,
      options: {
        responsive: false,
        maintainAspectRatio: false,
        title: {
          display: false,
        },
        legend: {
          display: false,
        },
        animation : false,
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }
        },
        tooltips: {enabled:false},
        scales: {
          yAxes: [{
            ticks: {
              callback: function() {
                return ''
              }
            },
            gridLines : {
              drawBorder: false,
              display : false
            }
          }],
          xAxes: [{
            ticks: {
              callback: function() {
                return ''
              }
            },
            gridLines : {
              drawBorder: false,
              display : false
            }
          }]
        }
      }
    })
    window.dnBar = new window.Chart(ctxdn, {
      type: 'bar',
      data: window.dnChartData,
      options: {
        responsive: false,
        maintainAspectRatio: false,
        title: {
          display: false,
        },
        legend: {
          display: false,
        },
        animation : false,
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }
        },
        tooltips: {enabled:false},
        scales: {
          yAxes: [{
            ticks: {
              callback: function() {
                return ''
              }
            },
            gridLines : {
              drawBorder: false,
              display : false
            }
          }],
          xAxes: [{
            ticks: {
              callback: function() {
                return ''
              }
            },
            gridLines : {
              drawBorder: false,
              display : false
            }
          }]
        }
      }
    })

    getCPUs()
    getCPUTemp()
    getMem()
    getNet()
    getProcesses()
    getCrypto()
  })
})