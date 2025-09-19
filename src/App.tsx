import { useCallback, useRef, useState } from 'react';
import './App.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import Dice from '@/Dice.tsx';
import sound from './assets/dice-roll.mp3';

const D6: string[] = ['1', '2', '3', '4', '5', '6'];
const D12: string[] = ['1', '1', '3', '3', '3', '6', '6', '8', '8', '10', '11', '12'];
const DICE_SOUND: HTMLAudioElement = new Audio(sound);

const url = (quantity: number): string => `https://www.random.org/integers/?num=${quantity}&min=0&max=12000&col=1&base=10&format=plain&rnd=new`;

const inRange = (value: number, min: number, max: number): number => {
  return Math.floor(value * (max - min + 1) + min);
};

const getRandomNumbers = async (quantity: number = 0, online: boolean = false): Promise<number[]> => {
  return online ? rng(quantity) : prng(quantity);
}

const prng = (quantity: number = 0): number[] => {
  return new Array(quantity).fill(null).map(() => Math.random());
}

const rng = async (quantity: number = 0): Promise<number[]> => {
  try {
    const response = await fetch(url(quantity));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: string = await response.json();

    return result.trim().split('\n').map((i: string) => +i / 12000);
  } catch {
    return prng(quantity);
  }
}

const d6 = (i: number): string => {
  return `d6-${D6[inRange(i, 0, 5)]}`;
}

const d12 = (i: number): string => {
  return `d12-${D12[inRange(i, 0, 11)]}`;
}

function App() {
  const [selectedD6, setSelectedD6] = useState('1');
  const [selectedD12, setSelectedD12] = useState('0');
  const [resultDices, setResultDices] = useState<string[]>([]);
  const [bonusDices, setBonusDices] = useState<string[]>([]);
  const [trueRandom, setTrueRandom] = useState<boolean>(false);
  const sound = useRef(false);

  const clearResult = (): void => {
    setBonusDices([]);
  };

  const playSound = () => {
    if (!sound.current) { return; }
    DICE_SOUND.currentTime = 0;
    DICE_SOUND.play();
  }

  const onRingChange = (value: string): void => {
    if (!value) { return; }

    setSelectedD6(value);
  }

  const onSkillChange = (value: string): void => {
    if (!value) { return; }

    setSelectedD12(value);
  }

  const onRollClick = async (): Promise<void> => {
    playSound();
    clearResult();

    const i = await getRandomNumbers(+selectedD6, trueRandom);
    const j = +selectedD12 ? await getRandomNumbers(+selectedD12, trueRandom) : [];

    setResultDices([
      ...i.map(n => d6(n)),
      ...j.map(n => d12(n)),
    ]);
  }

  const onAddRingClick = async (): Promise<void> => {
    playSound();
    const res = await getRandomNumbers(1, trueRandom);

    setBonusDices([...bonusDices, d6(res[0])]);
  }

  const onAddSkillClick = async (): Promise<void> => {
    playSound();
    const res = await getRandomNumbers(1, trueRandom);

    setBonusDices([...bonusDices, d12(res[0])]);
  }

  const onResultDiceClick = useCallback(async (index: number): Promise<void> => {
    playSound();
    const res = await getRandomNumbers(1, trueRandom);
    setResultDices(resultDices.map((v, i) => index === i
      ? v.includes('d6-') ? d6(res[0]) : d12(res[0])
      : v
    ));
  }, [resultDices, trueRandom]);

  const onBonusDiceClick = useCallback(async (index: number): Promise<void> => {
    playSound();
    const res = await getRandomNumbers(1, trueRandom);
    setBonusDices(bonusDices.map((v, i) => index === i
      ? v.includes('d6-') ? d6(res[0]) : d12(res[0])
      : v
    ));
  }, [bonusDices, trueRandom]);

  const onRandomSwitch = (e: boolean): void => {
    setTrueRandom(e);
  };

  const onSoundSwitch = (e: boolean): void => {
    sound.current = e;
  };

  return (
    <>
      <Card className="mb-2">
        <CardHeader>
          <div className="flex justify-between items-center self-stretch">
            <div className="flex items-center gap-2">
              <Switch id="sound" onCheckedChange={(e) => onSoundSwitch(e)} />
              <Label htmlFor="sound">Sound</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="rng">Use random.org RNG</Label>
              <Switch id="rng" onCheckedChange={(e) => onRandomSwitch(e)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="dice-symbol d6"></span>
            <ToggleGroup className="w-full" variant="outline" type="single" size="lg" value={selectedD6} onValueChange={onRingChange}>
              <ToggleGroupItem value="0" aria-label="Toggle 0" disabled={true}>0</ToggleGroupItem>
              <ToggleGroupItem value="1" aria-label="Toggle 1">1</ToggleGroupItem>
              <ToggleGroupItem value="2" aria-label="Toggle 2">2</ToggleGroupItem>
              <ToggleGroupItem value="3" aria-label="Toggle 3">3</ToggleGroupItem>
              <ToggleGroupItem value="4" aria-label="Toggle 4">4</ToggleGroupItem>
              <ToggleGroupItem value="5" aria-label="Toggle 5">5</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
            <span className="dice-symbol d12"></span>
            <ToggleGroup className="w-full" variant="outline" type="single" size="lg" value={selectedD12} onValueChange={onSkillChange}>
              <ToggleGroupItem value="0" aria-label="Toggle 0">0</ToggleGroupItem>
              <ToggleGroupItem value="1" aria-label="Toggle 1">1</ToggleGroupItem>
              <ToggleGroupItem value="2" aria-label="Toggle 2">2</ToggleGroupItem>
              <ToggleGroupItem value="3" aria-label="Toggle 3">3</ToggleGroupItem>
              <ToggleGroupItem value="4" aria-label="Toggle 4">4</ToggleGroupItem>
              <ToggleGroupItem value="5" aria-label="Toggle 5">5</ToggleGroupItem>
            </ToggleGroup>
          </div>

        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Button size="lg" onClick={onRollClick}>
            Roll
          </Button>
          <Button size="lg" onClick={onAddRingClick} variant="outline">
            +<span className="dice-symbol d6"></span>
          </Button>
          <Button size="lg" onClick={onAddSkillClick} variant="outline">
            +<span className="dice-symbol d12"></span>
          </Button>
        </CardFooter>
      </Card>
      {!!resultDices.length && (<Card>
        <CardContent className="flex flex-wrap gap-1">
          {resultDices.map((css, index) => <Dice key={index} face={css} onClick={() => onResultDiceClick(index)}></Dice>)}
        </CardContent>
        <CardContent className="flex flex-wrap gap-1">
          {bonusDices.map((css, index) => <Dice key={index} face={css} onClick={() => onBonusDiceClick(index)}></Dice>)}
        </CardContent>
      </Card>)}
    </>
  )
}

export default App
