<template>
  <div>View Panel</div>
</template>

<script setup>
useServerHead({
  style: [
    {
      innerHTML: 'body { color: red }',
    },
    {
      innerHTML: 'body { background: gray }',
    },
  ],
})
</script>
