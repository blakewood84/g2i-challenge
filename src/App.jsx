import React from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import PacmanLoader from "react-spinners/PacmanLoader";
import DOMPurify from 'dompurify';

const cssOverride = {
  display: 'block',
}

class Quiz extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      score: 0,
      slide: 0,
      triviaData: [],
      answers: []
    }
  }
  componentDidMount() {
    if(this.props?.triviaData) this.setState({ triviaData: this.props.triviaData }, () => console.log(this.state.triviaData));
  }

  evalAnswer(correctAnswer, userAnswer) {
    if(userAnswer.toLowerCase() == correctAnswer.toLowerCase()) this.setState({ score: this.state.score + 1});
    this.setState({ slide: this.state.slide + 1, answers: [...this.state.answers, {user: userAnswer, answer: correctAnswer.toLowerCase()}]});
  }

  render() {
    const ScoreCard = () => {
      const { score } = this.state;
      return (
        <>
          <h3>You Scored<br /> { score } / { this.state.triviaData.length }</h3>
          <div className="container text-left" style={{width: '550px', fontSize: '14px'}}>
            <ul style={{listStyleType: 'none'}}>
            {
              this.state.triviaData.map((item, index) => {
                return (
                  <li key={index + item} style={{margin: '10px 0px', listStylePosition: 'inside', textIndent: '-1.25em'}}>{ this.state.answers[index]['user'] == this.state.answers[index]['answer'] ? <span style={{color: "red", fontSize: '18px', fontWeight: 'bold'}}>+</span> : <span style={{color: "green", fontSize: '20px', fontWeight: 'bold'}}>-</span> } <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(item.question)}}></span></li>
                )
              })
            }
            </ul>
          </div>
          Reset Game? <br />
          <Button className="mr-2" variant="success" size="sm" onClick={ this.props.resetGame }>Yes</Button>
          <Button variant="danger" size="sm" onClick={ this.props.endGame }>No</Button>
        </>
      )
    };

    var cards = this.state.triviaData.map((item, index) => {   
      return (
        <>
          <div className="row">
              <div className="col-12 text-center">{item.category}</div>
          </div>
          <div className="row mt-4 d-flex align-items-center justify-content-center" style={{border: "1px solid black", height: '300px', width: '250px', wordBreak: 'break-word', fontSize: '14px'}}>
            <div className="col-12 text-center" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(item.question)}}></div>
          
          </div>
          <div className="row mt-4">
            <div className="col-12 text-center">{ index + 1 } out of {this.state.triviaData.length}</div>
          </div>
          <div className="row mt-4">
            <div className="col-6"><Button variant="success" onClick={this.evalAnswer.bind(this, item.correct_answer, 'true')}>True</Button></div>
            <div className="col-6"><Button variant="danger" onClick={this.evalAnswer.bind(this, item.correct_answer, 'false')}>False</Button></div>
          </div>
        </>
      )
    });

    return (
      <>
       <div className="container d-flex justify-content-center flex-column align-items-center">
         { this.state.slide <= this.state.triviaData.length && cards[this.state.slide] }
       </div> 
       { this.state.slide == this.state.triviaData.length && <ScoreCard /> }
      </>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      triviaData: [],
      startQuiz: false,
      loading: true,
      error: false,
      fetched: false,
      endgame: false,
    }
  }
  async componentDidMount() {
    setTimeout(() => this.fetchData(), 3000)
    
  }

  async resetGame() {
    console.log('Reset Game!');
    this.setState({
      triviaData: [],
      startQuiz: false,
      loading: true,
      error: false,
      fetched: false
    });
    await this.fetchData();
  }

  async fetchData(){
    axios.get('https://opentdb.com/api.php?amount=10&difficulty=hard&type=boolean').then((res) => {
      if(res.status == 200) this.setState({ triviaData: [...res.data.results], loading: false }, () => this.setState({ fetched: true }));
      else this.setState({ loading: false, error: true });
    });
  }

  endGame() {
    this.setState({ endgame: true});
  }

  render() {
    return (
      <div className="App d-flex align-items-center justify-content-center flex-column">
        <div className="container">
        { !this.state.startQuiz && <h1>Welcome to the Trivia Challenge</h1> }
        {
          this.state.loading && (
            <>
              <div className="m-4">
                <h5>Loading Challenge...</h5>
                <div className="d-flex justify-content-center mr-4"><PacmanLoader color={'#000000'} css={cssOverride} loading={this.state.loading} size={20} /></div>
              </div>
            </>
          )
        }
        { 
          !this.state.startQuiz && this.state.fetched && !this.state.endgame && (
            <>
              <div className="m-4">
                <p>You Will be Presented with 10 True / False Questions</p>
                <p className="mb-5">Can you score 100%?</p>
                <Button variant="primary" onClick={() => this.setState({startQuiz: true})}>Begin Challenge</Button>
              </div>
            </>
          )
        }
        { this.state.startQuiz && !this.state.endgame &&
          <Quiz triviaData={ this.state.triviaData } resetGame={ this.resetGame.bind(this) } endGame={ this.endGame.bind(this) } />
        }
        {
          this.state.endgame && 
          <div>Goodbye!</div>
        }
        </div>
      </div>
    )
  }
}
export default App;


