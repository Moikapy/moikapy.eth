export interface IMetadata {
  minted_by: string;
  name: string;
  description: string;
  background_color: string;
  image: string;
  animation_url: string;
  external_url: string;
  youtube_url: string;
  attributes: object[];
  properties: object[];
  fee_recipient: string;
  files: object[];
}
var _metadata: IMetadata = {
  minted_by: '',
  name: '',
  description: '',
  background_color: '',
  image: '',
  animation_url: '',
  external_url: '',
  youtube_url: '',
  attributes: [],
  properties: [],
  fee_recipient: '0x71D1272C2357bbb6a3C0E8aCE1AB84374a6426D9',
  files: [],
};
var _metadataTypes = {
  owner: 'string',
  nameType: 'string',
  descriptionType: 'string',
  background_colorType: 'color',
  imageType: 'file',
  animation_urlType: 'file',
  external_urlType: 'url',
  youtube_urlType: 'url',
  attributesType: 'array',
  propertiesType: 'array',
  filesType: 'array',
};
export {_metadata, _metadataTypes};
