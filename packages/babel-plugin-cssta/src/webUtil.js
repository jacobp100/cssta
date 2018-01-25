const startEndMarkers = commentMarkerBody => {
  const commentStartMarker = `/* Start ${commentMarkerBody} */\n`;
  const commentEndMarker = `/* End ${commentMarkerBody} */\n`;

  return { commentStartMarker, commentEndMarker };
};
module.exports.startEndMarkers = startEndMarkers;

module.exports.fileStartEndCommentMarkers = state => {
  const filename = state.file.opts.filename;
  return startEndMarkers(filename.replace(/\*/g, ""));
};
