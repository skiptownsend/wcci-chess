import React from 'react'
import "./../../index.css";


export default function WinLosePage(props) {
  return (
    <div>
      <div className='prompt'>
        <div className='childPrompt'>
          <h1 className='YouWin'>You Win!!</h1>
          <div className='playAgainParent'>
            <button className='playAgainBtn' onClick={()=> props.Restart()}>Play again</button>
          </div>
        </div>
      </div>
      <div className='WinPrompt'>
      </div>
    </div>
  )
}