import React, { useState, useEffect } from 'react'
import { createForm } from '@formily/core'
import { createSchemaField, useField } from '@formily/react'
import {
  Form,
  FormItem,
  FormLayout,
  Input,
  Select,
  Cascader,
  DatePicker,
  FormGrid,
  Upload,
  ArrayItems,
  Editable,
  PreviewText,
} from '@formily/antd'
import { action } from '@formily/reactive'
import { Card, Button, Spin } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

const form = createForm({
  readPretty: true,
  validateFirst: true,
})

const IDUpload = (props) => {
  const field = useField()
  return (
    <Upload
      {...props}
      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      headers={{
        authorization: 'authorization-text',
      }}
    >
      {field.editable && <Button icon={<UploadOutlined />}>上传复印件</Button>}
    </Upload>
  )
}

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    FormLayout,
    Input,
    DatePicker,
    Cascader,
    Select,
    IDUpload,
    ArrayItems,
    Editable,
  },
  scope: {
    fetchAddress: (field: any) => {
      const transform = (data: any = {}) => {
        return Object.entries(data).reduce((buf, [key, value]) => {
          if (typeof value === 'string')
            return buf.concat({
              label: value,
              value: key,
            })
          const { name, code, cities, districts } = value
          const _cities = transform(cities)
          const _districts = transform(districts)
          return buf.concat({
            label: name,
            value: code,
            children: _cities.length
              ? _cities
              : _districts.length
              ? _districts
              : undefined,
          })
        }, [])
      }

      field.loading = true
      fetch('//unpkg.com/china-location/dist/location.json')
        .then((res) => res.json())
        .then(
          action?.bound?.((data: any) => {
            field.dataSource = transform(data)
            field.loading = false
          })
        )
    },
  },
})

export default () => {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => {
      form.setInitialValues({
        username: 'Aston Martin',
        firstName: 'Aston',
        lastName: 'Martin',
        email: 'aston_martin@aston.com',
        gender: 1,
        birthday: '1836-01-03',
        address: ['110000', '110000', '110101'],
        idCard: [
          {
            name: 'this is image',
            thumbUrl:
              'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            uid: 'rc-upload-1615825692847-2',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
          },
        ],
        contacts: [
          { name: '张三', phone: '13245633378', email: 'zhangsan@gmail.com' },
          { name: '李四', phone: '16873452678', email: 'lisi@gmail.com' },
        ],
      })
      setLoading(false)
    }, 2000)
  }, [])
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        background: '#eee',
        padding: '40px 0',
      }}
    >
      <PreviewText.Placeholder value="-">
        <Card title="用户详情" style={{ width: 620 }}>
          <Spin spinning={loading}>
            <Form
              form={form}
              labelCol={5}
              wrapperCol={16}
              onAutoSubmit={console.log}
            >
              <SchemaField>
                <SchemaField.String
                  name="username"
                  title="用户名"
                  required
                  x-decorator="FormItem"
                  x-component="Input"
                />
                <SchemaField.Void
                  title="姓名"
                  x-decorator="FormItem"
                  x-decorator-props={{
                    feedbackLayout: 'none',
                  }}
                  x-component="FormGrid"
                >
                  <SchemaField.String
                    name="firstName"
                    x-decorator="FormItem"
                    x-component="Input"
                    x-component-props={{
                      placeholder: '姓',
                    }}
                    required
                  />
                  <SchemaField.String
                    name="lastName"
                    x-decorator="FormItem"
                    x-component="Input"
                    x-component-props={{
                      placeholder: '名',
                    }}
                    required
                  />
                </SchemaField.Void>
                <SchemaField.String
                  name="email"
                  title="邮箱"
                  required
                  x-validator="email"
                  x-decorator="FormItem"
                  x-component="Input"
                />
                <SchemaField.String
                  name="gender"
                  title="性别"
                  x-decorator="FormItem"
                  x-component="Select"
                  enum={[
                    {
                      label: '男',
                      value: 1,
                    },
                    {
                      label: '女',
                      value: 2,
                    },
                    {
                      label: '第三性别',
                      value: 3,
                    },
                  ]}
                  required
                />
                <SchemaField.String
                  name="birthday"
                  title="生日"
                  required
                  x-decorator="FormItem"
                  x-component="DatePicker"
                />
                <SchemaField.String
                  name="address"
                  title="地址"
                  required
                  x-decorator="FormItem"
                  x-component="Cascader"
                  x-reactions="{{fetchAddress}}"
                />
                <SchemaField.String
                  name="idCard"
                  title="身份证复印件"
                  required
                  x-decorator="FormItem"
                  x-component="IDUpload"
                />
                <SchemaField.Array
                  name="contacts"
                  title="联系人信息"
                  required
                  x-decorator="FormItem"
                  x-component="ArrayItems"
                >
                  <SchemaField.Object x-component="ArrayItems.Item">
                    <SchemaField.Void
                      x-decorator="FormItem"
                      x-component="ArrayItems.SortHandle"
                    />
                    <SchemaField.Void
                      name="popover"
                      title="维护联系人信息"
                      x-decorator="Editable.Popover"
                      x-component="FormLayout"
                      x-component-props={{
                        layout: 'vertical',
                      }}
                      x-reactions={[
                        {
                          fulfill: {
                            schema: {
                              title: '{{$self.query(".name").value() }}',
                            },
                          },
                        },
                      ]}
                    >
                      <SchemaField.String
                        name="name"
                        required
                        title="姓名"
                        x-decorator="FormItem"
                        x-component="Input"
                        x-component-props={{
                          style: {
                            width: 300,
                          },
                        }}
                      />
                      <SchemaField.String
                        name="email"
                        title="邮箱"
                        x-validator={[{ required: true }, 'email']}
                        x-decorator="FormItem"
                        x-component="Input"
                        x-component-props={{
                          style: {
                            width: 300,
                          },
                        }}
                      />
                      <SchemaField.String
                        name="phone"
                        required
                        title="手机号"
                        x-validator="phone"
                        x-decorator="FormItem"
                        x-component="Input"
                        x-component-props={{
                          style: {
                            width: 300,
                          },
                        }}
                      />
                    </SchemaField.Void>
                    <SchemaField.Void
                      x-decorator="FormItem"
                      x-component="ArrayItems.Remove"
                    />
                  </SchemaField.Object>
                  <SchemaField.Void
                    x-component="ArrayItems.Addition"
                    title="新增联系人"
                  />
                </SchemaField.Array>
              </SchemaField>
            </Form>
          </Spin>
        </Card>
      </PreviewText.Placeholder>
    </div>
  )
}