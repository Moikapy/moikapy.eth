import Input from '@/components/common/input';
import nft_storage from '../lib/nft-storage';

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
              ? await nft_storage.storeFileAsBlob(e.target.files[0])
              : '';
          data.length > 0
            ? onChange({
                cid: data,
                status: await nft_storage.getCIDStatus(data),
                fileType: e.target.files[0].type,
              })
            : onChange({ cid: data });
        }}
      />
    </>
  );
}
