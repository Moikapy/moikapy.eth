import Input from './common/input';
import NFTInput from './NFTInput';
export default function FormInputs({
  id,
  label,
  type,
  show,
  onChange,
  style = '',
}) {
  String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };
  switch (type) {
    case 'string':
      return (
        <>
          <Input
            id={id}
            label={label.capitalize()}
            placeholder={
              label == 'name'
                ? 'NFT Name'
                : label == 'description' && 'NFT Description'
            }
            onChange={onChange}
            className={`${style} col-6`}
          />
          <hr />
        </>
      );
    case 'color':
      return (
        <>
          {' '}
          <Input
            id={id}
            label={label.capitalize()}
            type={'color'}
            placeholder={''}
            onChange={onChange}
            className={`${style} col-6`}
          />
          <hr />
        </>
      );
    case 'url':
      return (
        <>
          {' '}
          <Input
            id={id}
            label={label.capitalize()}
            type={'url'}
            pattern={'https://.*'}
            placeholder={
              label == 'external url'
                ? 'https://yoursite.com'
                : label == 'youtube url' && 'https://youtubelink.com'
            }
            onChange={onChange}
            className={`${style} col-6`}
          />
          <hr />
        </>
      );
    default:
      return <></>;
  }
}
