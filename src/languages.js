const Languages = [
  {
    text: '英语',
    value: 1
  },
  {
    text: '日语',
    value: 2
  },
  {
    text: '韩语',
    value: 3
  },
  {
    text: '法语',
    value: 4
  },
  {
    text: '德语',
    value: 5
  },
  {
    text: '西班牙语',
    value: 6
  }
]
const languageMap = new Map(
  Languages.map(language => {
    return [language.value, language]
  })
)

function getLanguageByValue (value) {
  return languageMap.get(value)
}

export default Languages
export { getLanguageByValue }
