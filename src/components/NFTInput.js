import { useRef, useEffect, useState } from 'react';
import { MoiNFTs } from '../lib';
import Input from '@/components/common/input';
import oxsis from 'lib/oxsis';
const moiNFTs = new MoiNFTs({
  _host: process.env.RAREPRESS + '/' + process.env.RAREPRESS_VERSION,
  _storeAccount: process.env.WALLET_ADDRESS,
});

export default function NFTInput({ id, onChange, label, accept }) {
  return (
    <>
      <style jsx>{``}</style>
      <label htmlFor={id}>{label}</label>
      <Input
        type={'file'}
        accept={accept}
        onChange={async (e) => {
          const data =
            e.target.files.length !== 0
              ? await oxsis.storeFileAsBlob(e.target.files[0])
              : '';
          data.length > 0
            ? onChange({
              cid: data,
              status: await oxsis.getCIDStatus(data),
              fileType: e.target.files[0].type,
            })
            : onChange({ cid: data });
        }}
      />
    </>
  );
}
