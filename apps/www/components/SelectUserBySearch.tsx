import { Select } from 'antd'
import PropTypes from 'prop-types'
import { useState } from 'react'
import useSWR from 'swr'
import { db } from '~hooks/useLiveUsers'

const COLLECTION_NAME = 'simple-user-list'
const _ = db.command

export type SimpleUser = {
  _id: string
  customUserId: string
  name: string
  updatedAt: Date
}

export const useSimpleUserBySearch = (searchPartialId: string) => {
  const fetcher = async (collectionName: string, searchPartialId: string) => {
    const res = await db
      .collection(collectionName)
      .where(
        _.or(
          {
            // 靠 id 搜索
            customUserId: db.RegExp({
              regexp: searchPartialId,
              options: 'i',
            }),
          },
          {
            // 靠真名搜索
            name: db.RegExp({
              regexp: searchPartialId,
              options: 'i',
            }),
          }
        )
      )
      .get()
    return res.data as SimpleUser[]
  }
  return useSWR(searchPartialId ? [COLLECTION_NAME, searchPartialId] : null, fetcher)
}

export const useSimpleUser = (userIds?: string[]) => {
  const fetcher = async (collectionName: string, userIds: string[]) => {
    const res = await db
      .collection(collectionName)
      .where({
        _id: _.in(userIds),
      })
      .get()
    return res.data as SimpleUser[]
  }
  return useSWR(userIds && userIds.length > 0 ? [COLLECTION_NAME, userIds] : null, fetcher)
}

const SelectUserBySearch: React.FC<{
  value?: string
  onChange?: (newValue: string) => void
}> = (props) => {
  const [searchValue, setSearchValue] = useState(props.value ?? '')
  const { data } = useSimpleUserBySearch(searchValue)
  const handleOnChange = (value: string) => {
    console.log('value', value)
    setSearchValue(value)
    props.onChange?.(value)
  }
  return (
    <Select
      style={{
        minWidth: 90,
      }}
      showSearch
      value={searchValue}
      defaultActiveFirstOption={false}
      onSearch={setSearchValue}
      onChange={handleOnChange}
      filterOption={false}
    >
      {data?.map((d) => (
        <Select.Option key={d._id} value={d.customUserId}>
          {`${d.name}(${d.customUserId})`}
        </Select.Option>
      ))}
    </Select>
  )
}

SelectUserBySearch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
}

export default SelectUserBySearch
