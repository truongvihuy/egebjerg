function transform(msg) {
  msg.data = {
    _id: msg.data._id,
    category_id: msg.data.category_id,
    name: msg.data.name,
    name_comp: {
      input: msg.data.name,
      contexts: {
        category_id: msg.data.category_id,
      },
    },
    image: msg.data.image,
    slug: msg.data.slug,
    is_coop_xtra: msg.data.is_coop_xtra,
    is_ecology: msg.data.is_ecology,
    is_frozen: msg.data.is_frozen,
    status: msg.data.status,
  };
  return msg;
}
