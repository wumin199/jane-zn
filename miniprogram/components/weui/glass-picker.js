Component({
  properties: {
    items: {
      type: Array,
      value: []
    },
    value: {
      type: Array,
      value: [0]
    }
  },
  methods: {
    bindChange(e) {
      this.triggerEvent('change', { value: e.detail.value });
    }
  }
});
