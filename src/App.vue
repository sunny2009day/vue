<template>
  <div id="app">
    {{ this.$store.state.count }}
    <br/>
    {{ this.$store.getters.newCount }}
       <br/>
  {{this.$store.state.a.b}}
     <br/>
    <button @click="change">add</button>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {},
  mounted () {
    console.log(this.$store)
  },
  methods: {
    change () {
      // this.$store.commit('change')
      this.$store.dispatch('change')
    }
  }
}
</script>
