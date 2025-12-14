
import React from 'react';
import Layout from '@/components/layout/Layout';
import ApiKeySettings from '@/components/settings/ApiKeySettings';

const Settings = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <ApiKeySettings />
      </div>
    </Layout>
  );
};

export default Settings;

//demo