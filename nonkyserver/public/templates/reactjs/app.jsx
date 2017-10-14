var Processes = React.createClass({
  render: function() {
    var context = this
    return (
      <ul id="processes">
      { this.props.list.map(function(process,i){
        return (
          <li className="ps" key={i}>
            <div className={`${(context.props.fadeing) ? 'fade-out name' : 'fade-in name'}`}>{process[0]}</div>
            <div className={`${(context.props.fadeing) ? 'fade-out pid'  : 'fade-in pid'}`}>{process[1]}</div>
            <div className={`${(context.props.fadeing) ? 'fade-out cpu'  : 'fade-in cpu'}`}>
              {parseInt(process[2])}
              <span className="data p">%</span>
            </div>
          </li>
        )
      })}
      </ul>
    )
  }
})  
var Background = React.createClass({
  getInitialState: function() {
      return {
        fadeing:true,
        list:[]
      }
  },
  getProcesses: function (){
    var context = this
    fetch('/api/ps/4/2?_=' + new Date().getTime())
      .then(response => response.json())
      .then(json => {
        this.setState({fading: true}) // fade out
        this.timer = setTimeout(_ => {
          this.setState({list: json})
          this.setState({fading: false}) // fade back in
        }, 500)
      })
      .then(json => setTimeout(context.getProcesses, 3000))
      .catch(function(){setTimeout(context.getProcesses, 3000)})
  },
  componentDidMount: function() { 
    this.getProcesses()
  },

  render: function() {
    return (
      <Processes list={this.state.list} fadeing={this.state.fading}/>
      )
  }
})

ReactDOM.render(
  <Background />,
  document.getElementById('app')
)


