<template>
  <div class="foo">
    View Panel
  </div>
</template>

<script setup>
useServerHead({
  style: [
    {
      innerHTML: 'body { color: red }',
    },
    {
      innerHTML: '.foo { background: gray }',
    },
    {
      innerHTML: '.bar { color: blue }',
    },
    {
      innerHTML: '.foo { color: white }',
    },
  ],
})
</script>
