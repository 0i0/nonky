define(function (require) {
  return function makeTable(data,id){
    var dictionaryData = data
    var table = document.getElementById(id)
    for (var i in dictionaryData) {
      var tr = document.createElement('tr')
      
      for (var j in dictionaryData[i]) {
        var txt = document.createTextNode(dictionaryData[i][j])
        var td = document.createElement('td')
        td.appendChild(txt)
        tr.appendChild(td)
      }
      table.appendChild(tr)
    } 
  }
})