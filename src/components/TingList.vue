<template>
  <div>
    <Overlay :loading="loading"></Overlay>
    <div v-if="tings.length > 0">
      <v-simple-table class="my-10">
        <template v-slot:default>
          <thead>
          <tr>
            <th class="text-center">标题</th>
            <th class="text-center">听力文件</th>
            <th class="text-center">创建时间</th>
            <th class="text-center">更新时间</th>
            <th class="text-center">操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(ting, index) in tings" :key="ting.id">
            <td class="text-center">{{ ting.title }}</td>
            <td class="text-center">{{ fileName(ting.audioUrl) }}</td>
            <td class="text-center">{{ formatDateTime(ting.createdAt) }}</td>
            <td class="text-center">{{ formatDateTime(ting.updatedAt) }}</td>
            <td class="text-center">
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    plain
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item class="pointer" @click="updateTing(ting)"
                  >
                    <v-list-item-title>编辑</v-list-item-title>
                  </v-list-item>
                  <v-list-item class="pointer" @click="deleteTing(index, ting)"
                  >
                    <v-list-item-title>删除</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
          </tbody>
        </template>
      </v-simple-table>
      <div class="text-center">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          @input="selectPage"
        ></v-pagination>
      </div>
    </div>
    <UpdateTing></UpdateTing>
  </div>
</template>

<script>
import eventBus from '@/event-bus'
import EventTypes from '@/event-types'
import axios from '@/axios'
import UnauthorizedError from '@/error/unauthorized-error'
import UpdateTing from '@/components/UpdateTing.vue'
import Overlay from '@/components/Overlay.vue'
import { formatDateTime } from '@/util'

export default {
  name: 'TingList',
  components: {
    Overlay,
    UpdateTing
  },
  computed: {
    totalPages () {
      return Math.ceil(this.totalCount / this.pageSize)
    }
  },
  data () {
    return {
      loading: false,
      tings: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      programId: 0
    }
  },
  methods: {
    formatDateTime (dateTime) {
      return formatDateTime(dateTime)
    },
    fileName (audioUrl) {
      const indexOfSlash = audioUrl.lastIndexOf('/')

      return audioUrl.substring(indexOfSlash + 1)
    },
    tingCreated (ting) {
      // Assume only one user will update ting list at the same time
      this.totalCount += 1

      const page = 1

      this.getTings(page)
    },
    updateTing (ting) {
      eventBus.$emit(EventTypes.UPDATE_TING, ting)
    },
    tingUpdated (ting) {
      const index = this.tings.findIndex((it) => it.id === ting.id)

      if (index >= 0) {
        this.$set(this.tings, index, ting)
      }
    },
    deleteTing (i, ting) {
      if (!window.confirm(`确认删除${ting.title}？`)) {
        return
      }

      this.loading = true

      axios.delete(`/tings/${ting.id}`)
        .then((response) => {
          this.$delete(this.tings, i)
          this.totalCount -= 1

          if (this.totalPages === 0) {
            // No more data
            return Promise.resolve()
          } else if (this.page > this.totalPages) {
            // Current page is the last page, and no more data
            return this.getTings(this.page - 1)
          } else {
            // Current page is not the last page
            return this.getTings(this.page)
          }
        })
        .catch((error) => {
          console.error(error)

          if (error instanceof UnauthorizedError) {
            this.$router.push('/login')
          } else {
            this.$toast.error(error.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    selectPage (page) {
      this.getTings(page)
    },
    getTings (page) {
      this.loading = true
      this.page = page

      axios.get(`/tings?programId=${this.programId}&page=${this.page}&pageSize=${this.pageSize}`)
        .then((response) => {
          this.tings = response
        })
        .catch((error) => {
          console.error(error)

          this.$toast.error(error.message)
        })
        .finally(() => {
          this.loading = false
        })
    },
    programCreated (programId) {
      this.programId = programId
    }
  },
  created () {
    eventBus.$on(EventTypes.TING_CREATED, this.tingCreated)
    eventBus.$on(EventTypes.TING_UPDATED, this.tingUpdated)
    eventBus.$on(EventTypes.PROGRAM_CREATED, this.programCreated)

    this.programId = this.$route.params.programId

    if (!this.programId) {
      return
    }

    axios.get(`/tings:count?programId=${this.programId}`)
      .then((response) => {
        this.totalCount = response
      })
      .then(() => {
        const page = 1

        return this.getTings(page)
      })
      .catch((error) => {
        console.error(error)

        this.$toast.error(error.message)
      })
      .finally(() => {
        this.loading = false
      })
  }
}
</script>
