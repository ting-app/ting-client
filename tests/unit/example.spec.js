import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App.vue', () => {
  it('renders app component', () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['router-view', 'v-app', 'v-main']
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
