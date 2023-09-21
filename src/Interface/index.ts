export type Item = {
  tabID: string
  title?: string
  notes: [
    {
      desc?: string
      timeStamp: string
      attachment?: string[]
    }
  ]
  url?: string
  createdAt: Date
}
