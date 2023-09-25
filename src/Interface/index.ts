export type Item = {
  tabID: number
  vid: string
  title?: string
  notes: [
    {
      desc?: string
      timeStamp: number
      attachment?: string
    }
  ]
  url?: string
  createdAt?: string
}
