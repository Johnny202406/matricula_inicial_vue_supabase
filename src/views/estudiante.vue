<script lang="ts" setup>
import { Skeleton } from "@/components/ui/skeleton"
</script>

<template>
  <div class="flex flex-col ">
    <Skeleton class="h-[125px] w-[250px] rounded-xl bg-amber-300 " />
    <div class="gap-2 flex flex-col mt-2">
      <Skeleton class="h-4 w-[250px] bg-amber-300 mt-2"  />
      <Skeleton class="h-4 w-[200px]  bg-amber-300" />
    </div>
  </div>
</template>
<style scoped>

</style>
