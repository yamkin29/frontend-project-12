import leoProfanity from 'leo-profanity'
import enDictionary from 'leo-profanity/dictionary/default.json'
import { flatWords as ruDictionary } from 'russian-bad-words'

leoProfanity.clearList()
leoProfanity.add(enDictionary)
leoProfanity.add(ruDictionary)

export default leoProfanity
