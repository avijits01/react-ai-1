import { createContext } from 'react'
import { ThemeContextI, IAppContext} from '../types'
import { MODELS} from '../constants'
import { IMAGE_MODELS } from '../constants'

const ThemeContext = createContext<ThemeContextI>({
    theme: {},
    setTheme: () => null,
    themeName: ''
  })

  const AppContext = createContext<IAppContext>({
    chatType: MODELS.gptTurbo,
    imageModel: IMAGE_MODELS.fastImage.label,
    setChatType: () => null,
    handlePresentModalPress: () => null,
    setImageModel: () => null,
    closeModal: () => null
  })

  export {
    ThemeContext,
AppContext
  }