export type Item = {
  tabID: number
  vid: string
  title?: string
  notes: [
    {
      id: number
      desc?: string
      timeStamp: number
      attachment?: string
    }
  ]
  url?: string
  createdAt?: string
  isExpand?: boolean
  newCreated?: boolean
}
