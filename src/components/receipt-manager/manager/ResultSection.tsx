/** @format */
import Card from '@/components/Card';
import styles from '@/styles/components/receipt-manager/manager/ResultSection.module.css';

interface IResultSectionProps {
  setResultReady: (state: boolean) => void;
}

export default function ResultSection(props: React.PropsWithChildren<IResultSectionProps>) {
  return <div className={[].join(' ')}>
    <Card className={[styles.resultSection].join(' ')}>
      <div className={[styles.resultSectionHeader].join(' ')}>
        <h2>Result</h2>
        <div className={[styles.resultSectionHeaderControls].join(' ')}>
          <button onClick={() => { props.setResultReady(false) }}>Back</button>
          <button>Export data</button>
        </div>
      </div>
      <div className={[styles.resultSectionContent].join(' ')}>
        
      </div>
    </Card>
  </div>;
}
