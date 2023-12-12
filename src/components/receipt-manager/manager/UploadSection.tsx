/** @format */
import Card from '@/components/Card';
import styles from '@/styles/components/receipt-manager/manager/UploadSection.module.css';

interface IUploadSectionProps {
  className?: string
  setResultReady: (state: boolean) => void;
}

export default function UploadSection(props: React.PropsWithChildren<IUploadSectionProps>) {
  return <div className={[].join(' ')}>
    <Card className={[styles.uploadSection].join(' ')}>
      <div className={[styles.uploadSectionHeader].join(' ')}>
        <h2>Receipts</h2>
        <div className={[styles.uploadSectionHeaderControls].join(' ')}>
          <button onClick={() => { props.setResultReady(true) }}>Result</button>
          <br />
          <button>Upload data</button>
          <button>Clear data</button>
        </div>
      </div>
      <div className={[styles.uploadSectionContent].join(' ')}>
      </div>
    </Card>
  </div>;
}
