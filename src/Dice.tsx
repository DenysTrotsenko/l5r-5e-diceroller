import { memo } from 'react';
import './Dice.css';

interface DiceProps {
  face: string;
  onClick?: () => void;
}

function Dice({ face, onClick }: DiceProps) {
  return (<div className={'dice ' + face} onClick={onClick}></div>)
}

export default memo(Dice)
