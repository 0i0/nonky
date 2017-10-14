requirejs.config({
  baseUrl: '/js/lib',
  paths: {
    jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min',
  }
})
define(['jquery'],function ($) {
  // get Top processes by sorted by the second column (cpu useage)
  function getProcesses(){
    $.ajax({
      url: '/api/ps/4/2?_=' + new Date().getTime(),
    }).done(function(data) {
      var $ul = $('#processes')
      $('.data').fadeOut(500,function(){
        $ul.html('')
        for(var i =0;i<data.length;i++){
          var $tmpl = $('\
            <li class="ps">\
              <div class="data name">'+data[i][0]+'</div>\
              <div class="data pid">'+data[i][1]+'</div>\
              <div class="data cpu">'+parseInt(data[i][2])+'<span class="p">%</span></div>\
            </li>\
          ')
          $tmpl.find('.data').hide()
          $tmpl.appendTo($ul)
          $('.data').fadeIn(500)
        }
      })
    }).always(function(err){
      setTimeout(getProcesses,window.refreshRate) 
    })
  }
  $( document ).ready(function(){
    window.timers = {}
    window.refreshRate = 3000
    getProcesses()
  })
})