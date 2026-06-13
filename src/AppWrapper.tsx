import { useState } from 'react'
import SplashScreen from './components/SplashScreen'
import Onboarding from './components/Onboarding'
import App from './App'

const DONE_KEY = 'secretdiary-pro_onboarded_v1'
type Phase = 'splash' | 'onboard' | 'app'

export default function AppWrapper() {
  const [phase, setPhase] = useState<Phase>('splash')
  const features = ["AES-256 encryption", "Mood and weather tags", "Rich text entries", "Auto-lock on idle"]
  return (
    <>
      {phase === 'splash' && <SplashScreen onDone={()=>setPhase(localStorage.getItem(DONE_KEY)?'app':'onboard')} color1="#a855f7" color2="#9333ea" emoji="🔒" name="SecretDiary Pro" tagline="AES-encrypted private diary"/>}
      {phase === 'onboard' && <Onboarding onDone={()=>{localStorage.setItem(DONE_KEY,'1');setPhase('app')}} color1="#a855f7" emoji="🔒" name="SecretDiary Pro" features={features}/>}
      {phase === 'app' && <App/>}
    </>
  )
}