<template>
  <div class="about">
    <div>
      <n-h2 prefix="bar">
        <n-text type="primary">
          This is an about page
        </n-text>
      </n-h2>
      <n-blockquote>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
      </n-blockquote>
      <n-p>
        <n-button>Default</n-button>
      </n-p>
      <n-p>
        <n-icon size="40" color="white" :depth="5">
          <icon icon="fluent:braces-48-regular" />
        </n-icon>
      </n-p>
      <n-p>
        <n-icon-wrapper :size="40" :border-radius="10">
          <n-icon size="34" >
            <icon icon="fluent:checkmark-16-filled" />
          </n-icon>
        </n-icon-wrapper>
      </n-p>
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
