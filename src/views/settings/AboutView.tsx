import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { GithubIcon } from '../../components/icons/GithubIcon';
import { TwitterIcon } from '../../components/icons/TwitterIcon';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <h3 className="text-xl font-bold mb-2">About BedTales</h3>
        <p className="text-[--text-secondary]">
          BedTales is an AI-powered storyteller designed to spark imagination and create magical bedtime moments. 
          Built with cutting-edge technology, it empowers parents and children to craft unique, illustrated stories in minutes.
          Our mission is to make storytelling accessible, fun, and a cherished part of every family's routine.
        </p>
      </Card>

      <Card>
        <h3 className="text-xl font-bold mb-4">Connect & Contribute</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href="https://github.com/google/aistudio-web-apps" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full">
              <GithubIcon className="w-5 h-5 mr-2" />
              View on GitHub
            </Button>
          </a>
          <a 
            href="https://x.com/GoogleForDevs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full !bg-[#1DA1F2] hover:!bg-[#0c85d0] focus:!ring-[#1DA1F2]">
              <TwitterIcon className="w-5 h-5 mr-2" />
              Follow on X
            </Button>
          </a>
        </div>
      </Card>
       <Card>
        <h3 className="text-xl font-bold mb-2">Version</h3>
        <p className="text-[--text-secondary]">
          Version 1.1.0
        </p>
      </Card>
    </div>
  );
};
