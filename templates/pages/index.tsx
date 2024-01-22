/** @format */

import Content from "@/lib/container/Content";
import Layout from "@/lib/layouts/Layout";

export default function Home() {
  return (
    <>
      {/* Replace with own layout */}
      <Layout>
        <Content className={['applyHeaderOffset'].join(' ')}>
          {/* Insert stuff here */}
        </Content>
      </Layout>
    </>
  );
}
