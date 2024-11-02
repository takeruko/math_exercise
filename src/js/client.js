import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import { createRoot } from 'react-dom/client';

const STORAGE_KEY = 'math_exercise';
const APP_DEF = {
  'DivisorBeginner': {
    title: '約数はどれだ？ 初級(60秒)'
  },
  'DivisorMiddle': {
    title: '約数はどれだ？ 中級(60秒)'
  }
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const makeQuestion = (a_min, a_max, b_min, b_max, ans_num) => {
  let a = getRandomInt(a_min, a_max);
  let b = getRandomInt(b_min, b_max);
  let q = a * b;
  let ans_min = a_min < b_min ? a_min : b_min;
  let ans_max = a_max > b_max ? a_max : b_max;
  
  let ans = [a];
  do {
    let new_ans = getRandomInt(ans_min, ans_max);
    if (!ans.includes(new_ans) && q % new_ans !== 0) {
      ans.push(new_ans);
    }
  } while (ans.length < ans_num);

  return {
    "question": q,
    "answers": ans.sort((a, b) => {return a - b;})
  };
};

const getTimestamp = (locale = 'ja-JP') => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  
  // フォーマットされた文字列を出力
  return formatter.format(now);
};

const Countdown = ({ initialSeconds, onComplete }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
      if (seconds > 0) {
          const timerId = setTimeout(() => setSeconds(seconds - 1), 1000);
          return () => clearTimeout(timerId);
      } else {
          // secondsが0になった時にonCompleteを呼び出す
          onComplete();
      }
  }, [seconds, onComplete]);

  return (
      <div className='header'>残り{seconds}秒</div>
  );
};

const ReadyGo = ({ onComplete }) => {
  const [seconds, setSeconds] = useState(4);

  useEffect(() => {
      if (seconds > 0) {
          const timerId = setTimeout(() => setSeconds(seconds - 1), 1000);
          return () => clearTimeout(timerId);
      } else {
          // secondsが0になった時にonCompleteを呼び出す
          onComplete();
      }
  }, [seconds, onComplete]);

  return (
      <div>{
        seconds === 1 ? <span className='message'>はじめ！！</span> : <span className='number'>{seconds - 1}</span>
      }</div>
  );
}

const DivisorApp = ({a_min, a_max, b_min, b_max, ans_num, sec, app_name}) => {
  const [score, setScore] = useState(0);
  const [showAnswerMark, setShowAnswerMark] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [question, setQuestion] = useState(makeQuestion(a_min, a_max, b_min, b_max, ans_num));
  const [showReadyGo, setShowReadyGo] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [newScore, setNewScore] = useState();
  const [timestamp, setTimestamp] = useState(Date.now());

  const title = APP_DEF[app_name].title;
  const q = question.question;
  const answers = question.answers;

  const startGame = () => {
    setShowReadyGo(false);
    setShowApp(true);
  };

  const endGame = () => {
    setTimestamp(getTimestamp());
    setShowAnswerMark(false);
    setShowApp(false);
    setShowEnd(true);
  };

  const saveAndShowResult = (app_name, score, timestamp) => {
    setNewScore(saveResult(app_name, score, timestamp))
    setShowEnd(false);
    setShowResult(true);
  };

  const showAnswer = (q, ans) => {
    if (q % ans === 0) {
      setScore(score + 1);
      setIsCorrectAnswer(true);
    }
    else {
      setScore(score - 1);
      setIsCorrectAnswer(false);
    }
    setShowAnswerMark(true);
  };

  const getNextQuestion = () => {
    setQuestion(makeQuestion(a_min, a_max, b_min, b_max, ans_num));
    setShowAnswerMark(false);
  };

  return (
    <div>
      { showReadyGo && 
        <div className='header'>
          <h1>{title}</h1>
          <div>スコア:{score}</div>
          <div>残り{sec}秒</div>
          <ReadyGo onComplete={startGame} />
        </div>
      }
      { showEnd &&
        <div className='header'>
          <h1>{title}</h1>
          <div>スコア:{score}</div>
          <div>残り0秒</div>
          <div><span className='message'>終了！！</span></div>
          <button type="button" className="btn btn-primary p-3 m-3 menu-btn" onClick={() => {saveAndShowResult(app_name, score, timestamp);}}><span>結果を見る</span></button>
        </div>
      }
      {
        showResult && 
        <div className='header'>
          <h1>{title}</h1>
          <div className='result'>今回のスコア:{score}</div>
          <ResultList app_name={app_name} newScore={newScore} />
        </div>
      }
      { showApp && 
        <div>
          <div className='header'>
            <h1>{title}</h1>
            <div>スコア:{score}</div>
            <div>残り{sec}秒</div>
            <Countdown initialSeconds={sec} onComplete={endGame} />
          </div>
          <div className='question'>{q}</div>
          <div class="container text-center">
            <div class="row row-cols-2">
              <div class="col">
                <button type="button" className="btn btn-primary m-3 ans-btn" onClick={() => {showAnswer(q, answers[0]);}}>
                  <span className='ans-txt'>{answers[0]}</span>
                </button>
              </div>
              <div class="col">
                <button type="button" className="btn btn-primary m-3 ans-btn" onClick={() => {showAnswer(q, answers[1]);}}>
                  <span className='ans-txt'>{answers[1]}</span>
                </button>
              </div>
              <div class="col">
                <button type="button" className="btn btn-primary m-3 ans-btn" onClick={() => {showAnswer(q, answers[2]);}}>
                  <span className='ans-txt'>{answers[2]}</span>
                </button>
              </div>
              <div class="col">
                <button type="button" className="btn btn-primary m-3 ans-btn" onClick={() => {showAnswer(q, answers[3]);}}>
                  <span className='ans-txt'>{answers[3]}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      { showAnswerMark ?
        <div>
          <div id="ans-mark">
            { isCorrectAnswer ? <div><i className="bi bi-circle correct"></i><span className="get-score">+1点</span></div> : <div><i class="bi bi-x-lg incorrect"></i><span className="lost-score">-1点</span> </div>}
            <span>タップして次へ</span>
          </div>
          <div id="ans-click-area" onClick={getNextQuestion}></div>
        </div>
        :
        <div></div>
      }
    </div>
  );
};

const saveResult = (app_name, score, timestamp) => {
  const storedResult = localStorage.getItem(STORAGE_KEY);
  let allResult = storedResult ? JSON.parse(storedResult) : {};
  let appResult = app_name in allResult ? allResult[app_name] : [];

  // 今回のスコアをローカルストレージに保存
  const newScore = {
    id: appResult.length + 1,
    score: score,
    timestamp: timestamp
  };
  appResult.push(newScore);
  appResult = appResult.sort((a, b) => b.score - a.score);
  allResult[app_name] = appResult.length <= 10 ? appResult : appResult.slice(0, 10);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allResult));

  return newScore;
};

const ResultList = ({app_name, newScore}) => {
  const storedResult = localStorage.getItem(STORAGE_KEY);
  const allResult = storedResult ? JSON.parse(storedResult) : {};
  let appResult = app_name in allResult ? allResult[app_name] : [];

  appResult = appResult.sort((a, b) => {b.score - a.score});

  const isHiscore = appResult[0].id === newScore.id;

  return (
    <div>
      <h2>{isHiscore ? '新記録！！' : ''}</h2>
      <ol>
        {appResult.map((v) => <li className={v.id === newScore.id ? 'newscore' : ''}>{v.score}点 : {v.timestamp}</li>)}
      </ol>
    </div>
  );

};

const MenuScreen = () => {
  return (
    <div className="text-center">
      <h1>約数はどれだ？</h1>
      <Link to="/DivisorBeginner" className="btn btn-primary p-3 m-3 menu-btn"><span>初級(60秒)</span></Link><br />
      <Link to="/DivisorMiddle" className="btn btn-primary p-3 m-3 menu-btn"><span>中級(60秒)</span></Link>
    </div>
  );
};

const MathApp = () => {
  
  return (
    <BrowserRouter basename='/math_exercise'>
        <Routes>
          <Route exact path="/">
            <Route index element={<MenuScreen />} />
            <Route path="DivisorBeginner" element={
              <DivisorApp
                a_min={2}
                a_max={9}
                b_min={2}
                b_max={9}
                ans_num={4}
                sec={60}
                app_name={'DivisorBeginner'}  
              />
            } />
            <Route path="DivisorMiddle" element={
              <DivisorApp
                a_min={2}
                a_max={15}
                b_min={2}
                b_max={15}
                ans_num={4}
                sec={60}  
                app_name={'DivisorMiddle'}  
              />
            } />
          </Route>
        </Routes>
    </BrowserRouter>
  );
};

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<MathApp />);
