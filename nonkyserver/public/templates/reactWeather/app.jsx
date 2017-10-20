var Weather = React.createClass({
  render: function() {
    var context = this
    return (
      <ul id="weather-days">
      { this.props.list.map(function(weatherDays,i){
        return (
          <li className="weather-day" key={i}>
            <img className="weather-icon" src={`${'https://www.metaweather.com/static/img/weather/'+ weatherDays.weather_state_abbr +'.svg'}`}/>
            {/*
            <div className="weather-state">{weatherDays.weather_state_name}</div>
            */}
            <div className="temp">{Math.round(weatherDays.the_temp*10)/10}°</div>
            <div className="day">{['Sunday','Monday','Tuesday','Wednsday','Thurstay','Friday','Sautrday'][((new Date(weatherDays.applicable_date)).getDay())]}</div>
            
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
  getWeather: function (){
    var context = this
    fetch('/api/location')
      .then(response => response.json())
      .then(json => {
        fetch('/api/proxy?url=https://www.metaweather.com/api/location/search/?lattlong='+json[0]+','+json[1])
          .then(response => response.json())
          .then(json => {
            fetch('/api/proxy?url=https://www.metaweather.com/api/location/'+json[0].woeid)
              .then(response => response.json())
              .then(json => {
                this.setState({fading: true}) // fade out
                this.timer = setTimeout(_ => {
                  this.setState({list: json.consolidated_weather.splice(0,3)})
                  this.setState({fading: false}) // fade back in
                }, 500)
              })
              .then(_ => setTimeout(context.getWeather, 1000*60*60*3))
              .catch(function(err){
                console.log(err)
                setTimeout(context.getWeather, 1000*60*60*3)})
              })
          })
          .catch(function(err){
            console.log(err)
            setTimeout(context.getWeather, 1000*60*60*3)})
          })
      })
      .catch(function(err){
        console.log(err)
        setTimeout(context.getWeather, 1000*60*60*3)})
      })
  },
  componentDidMount: function() { 
    this.getWeather()
  },

  render: function() {
    return (
      <Weather list={this.state.list} fadeing={this.state.fading}/>
      )
  }
})

ReactDOM.render(
  <Background />,
  document.getElementById('app')
)


