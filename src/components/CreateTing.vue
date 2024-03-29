<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">添加听力</span>
        </v-card-title>
        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
          >
            <v-text-field
              v-model="title"
              :counter="100"
              :rules="titleRules"
              label="标题*"
              required
            ></v-text-field>
            <v-textarea
              clearable
              clear-icon="mdi-close-circle"
              label="描述*"
              v-model="description"
              :counter="250"
              :rules="descriptionRules"
            ></v-textarea>
            <v-textarea
              clearable
              clear-icon="mdi-close-circle"
              label="原文*"
              v-model="content"
              :counter="3000"
              :rules="contentRules"
            ></v-textarea>
            <v-file-input
              accept="audio/mp3"
              v-model="audioFile"
              :rules="audioFileRules"
              label="听力文件（mp3 格式）*"
              :show-size="true"
            >
            </v-file-input>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            :disabled="!valid || loading"
            :loading="loading"
            @click="create"
            class="ma-2"
          >
            添加
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
  name: 'CreateTing',
  data () {
    return {
      programId: 0,
      dialog: false,
      valid: true,
      loading: false,
      title: '',
      titleRules: [
        v => !!v || '标题不能为空',
        v => (v && v.length <= 100) || '标题不能超过100个字符'
      ],
      description: '',
      descriptionRules: [
        v => !!v || '描述不能为空',
        v => (v && v.length <= 250) || '描述不能超过250个字符'
      ],
      content: '',
      contentRules: [
        v => !!v || '原文不能为空',
        v => (v && v.length <= 3000) || '原文不能超过3000个字符'
      ],
      audioFile: null,
      audioFileRules: [
        v => !!v || '听力文件不能为空'
      ]
    }
  },
  methods: {
    close () {
      this.$refs.form.reset()
      this.dialog = false
    },
    create () {
      if (!this.$refs.form.validate()) {
        return
      }

      this.loading = true

      const file = this.audioFile
      const fileName = randomFileName(file.name)

      axios.get(`/s3/presignedUrl?permission=c&fileName=${fileName}`)
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
            programId: this.programId,
            title: this.title,
            description: this.description,
            content: this.content,
            audioUrl: fileUrl
          }

          return axios.post('/tings', ting)
        })
        .then((response) => {
          this.close()

          eventBus.$emit(EventTypes.TING_CREATED, response)
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
    eventBus.$on(EventTypes.CREATE_TING, (programId) => {
      this.dialog = true
      this.programId = programId
    })
  }
}
</script>
