import Input from '@/components/common/input';
import nft from '../lib/nft-storage';

export default function NFTInput({ id, onChange, label, accept }) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <Input
        type={'file'}
        accept={accept}
        onChange={async (e) => {
          const data =
            e.target.files.length !== 0
              ? await nft.storeFileAsBlob(e.target.files[0])
              : '';
          data.length > 0
            ? onChange({
                cid: data,
              status: await nft.getCIDStatus(data),
                fileType: e.target.files[0].type,
              })
            : onChange({ cid: data });
        }}
      />
    </>
  );
}
