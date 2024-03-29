<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">更新听力</span>
        </v-card-title>
        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            v-if="ting"
          >
            <v-text-field
              v-model="ting.title"
              :counter="100"
              :rules="titleRules"
              label="标题*"
              required
            ></v-text-field>
            <v-textarea
              clearable
              clear-icon="mdi-close-circle"
              label="描述*"
              v-model="ting.description"
              :counter="250"
              :rules="descriptionRules"
            ></v-textarea>
            <v-textarea
              clearable
              clear-icon="mdi-close-circle"
              label="原文*"
              v-model="ting.content"
              :counter="3000"
              :rules="contentRules"
            ></v-textarea>
            <template v-if="!reUploadFile">
              <span>听力文件：{{ fileName }}</span>
              <v-btn class="ma-2" @click="reUploadFile = true">重新上传</v-btn>
            </template>
            <v-file-input
              accept="audio/mp3"
              v-model="audioFile"
              :rules="audioFileRules"
              label="听力文件（mp3 格式）*"
              :show-size="true"
              v-if="reUploadFile"
            >
              <template v-slot:append-outer>
                <v-btn v-if="!loading" @click="reUploadFile = false">取消上传</v-btn>
              </template>
            </v-file-input>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            :disabled="!valid || loading"
            :loading="loading"
            @click="update"
            class="ma-2"
          >
            更新
          </v-btn>
          <v-btn
            :disabled="loading"
            @click="close"
            class="ma-2"
          >
            取消
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import eventBus from '@/event-bus'
import axios from '@/axios'
import UnauthorizedError from '@/error/unauthorized-error'
import EventTypes from '@/event-types'
import { randomFileName } from '@/util'

export default {
  name: 'UpdateTing',
  computed: {
    fileName () {
      if (!this.ting) {
        return ''
      }

      const indexOfSlash = this.ting.audioUrl.lastIndexOf('/')

      return this.ting.audioUrl.substring(indexOfSlash + 1)
    }
  },
  data () {
    return {
      dialog: false,
      valid: true,
      loading: false,
      titleRules: [
        v => !!v || '标题不能为空',
        v => (v && v.length <= 100) || '标题不能超过100个字符'
      ],
      descriptionRules: [
        v => !!v || '描述不能为空',
        v => (v && v.length <= 250) || '描述不能超过250个字符'
      ],
      contentRules: [
        v => !!v || '原文不能为空',
        v => (v && v.length <= 3000) || '原文不能超过3000个字符'
      ],
      audioFile: null,
      audioFileRules: [
        v => !!v || '听力文件不能为空'
      ],
      ting: null,
      reUploadFile: false
    }
  },
  methods: {
    close () {
      this.$refs.form.reset()
      this.dialog = false
      this.reUploadFile = false
    },
    update () {
      if (!this.$refs.form.validate()) {
        return
      }

      this.loading = true

      let promise = null

      if (this.reUploadFile) {
        const file = this.audioFile
        const fileName = randomFileName(file.name)

        promise = axios.get(`/s3/presignedUrl?permission=c&fileName=${fileName}`)
          .then((presignedUrl) => {
            return axios.put(presignedUrl, file, {
              withCredentials: false
            })
              .then((_) => {
                const index = presignedUrl.lastIndexOf('?')

                return presignedUrl.substring(0, index)
              })
          })
          .then((fileUrl) => {
            const ting = {
              ...this.ting,
              audioUrl: fileUrl
            }

            return axios.put(`/tings/${ting.id}`, ting)
          })
      } else {
        const ting = {
          ...this.ting
        }

        promise = axios.put(`/tings/${ting.id}`, ting)
      }

      promise.then((response) => {
        this.close()

        eventBus.$emit(EventTypes.TING_UPDATED, response)
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
    }
  },
  created () {
    eventBus.$on(EventTypes.UPDATE_TING, (ting) => {
      this.dialog = true
      this.ting = {
        ...ting
      }
    })
  }
}
</script>
