import { describe, it, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { expect } from 'chai';
import { spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';

const BASE_URL = 'http://localhost:3002';
let mockServerProcess: ChildProcess | null = null;

const sleep = promisify(setTimeout);

describe('Mock Server Field Validation Tests', () => {
  beforeAll(async () => {
    // 自动启动Mock服务器
    console.log('🚀 启动Mock服务器...');
    mockServerProcess = spawn('node', ['dist/cli.js', 'mock', 'https://petstore.swagger.io/v2/swagger.json', '--port', '3002'], {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    // 等待服务器启动
    await sleep(5000);

    // 检查Mock服务器是否运行
    let retries = 15;
    while (retries > 0) {
      try {
        await axios.get(`${BASE_URL}/health`);
        console.log('✅ Mock服务器已启动');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error('❌ Mock服务器启动失败');
          throw new Error('Mock服务器启动失败');
        }
        await sleep(2000);
      }
    }
  }, 30000);

  afterAll(async () => {
    // 测试完成后关闭Mock服务器
    if (mockServerProcess) {
      console.log('🛑 关闭Mock服务器...');
      mockServerProcess.kill('SIGTERM');
      await sleep(1000);
    }
  });

  describe('API响应字段验证', () => {
    it('应该验证 /v2/store/inventory 接口返回正确的字段结构', async () => {
      const response = await axios.get(`${BASE_URL}/v2/store/inventory`);
      
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('object');
      
      // 验证返回的是对象且包含additionalProperties字段
      const keys = Object.keys(response.data);
      expect(keys.length).to.be.greaterThan(0);
      
      // 验证每个键对应的值都是数字
      keys.forEach(key => {
        expect(typeof response.data[key]).to.equal('number');
      });
      
      console.log('✅ /v2/store/inventory 字段验证通过');
    });

    it('应该验证 /v2/pet/findByStatus 接口返回正确的字段结构', async () => {
      const response = await axios.get(`${BASE_URL}/v2/pet/findByStatus?status=available`);
      
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
      
      if (response.data.length > 0) {
        const pet = response.data[0];
        expect(pet).to.be.an('object');
        expect(pet).to.have.property('id');
        expect(pet).to.have.property('name');
        expect(pet).to.have.property('status');
        
        // 验证可选字段
        if (pet.category) {
          expect(pet.category).to.be.an('object');
          expect(pet.category).to.have.property('id');
          expect(pet.category).to.have.property('name');
        }
        
        if (pet.photoUrls) {
          expect(pet.photoUrls).to.be.an('array');
        }
        
        if (pet.tags) {
          expect(pet.tags).to.be.an('array');
          if (pet.tags.length > 0) {
            const tag = pet.tags[0];
            expect(tag).to.have.property('id');
            expect(tag).to.have.property('name');
          }
        }
      }
      
      console.log('✅ /v2/pet/findByStatus 字段验证通过');
    });

    it('应该验证 /v2/pet/{petId} 接口返回正确的字段结构', async () => {
      const response = await axios.get(`${BASE_URL}/v2/pet/1`);
      
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('object');
      
      // 验证必需字段
      expect(response.data).to.have.property('id');
      expect(response.data).to.have.property('name');
      expect(response.data).to.have.property('photoUrls');
      expect(response.data.photoUrls).to.be.an('array');
      
      // 验证可选字段
      if (response.data.category) {
        expect(response.data.category).to.be.an('object');
        expect(response.data.category).to.have.property('id');
        expect(response.data.category).to.have.property('name');
      }
      
      if (response.data.tags) {
        expect(response.data.tags).to.be.an('array');
      }
      
      if (response.data.status) {
        expect(['available', 'pending', 'sold']).to.include(response.data.status);
      }
      
      console.log('✅ /v2/pet/{petId} 字段验证通过');
    });

    it('应该验证字段类型的正确性', async () => {
      const response = await axios.get(`${BASE_URL}/v2/pet/1`);
      const data = response.data;
      
      // 验证数字类型字段
      expect(typeof data.id).to.be.oneOf(['number', 'string']);
      
      // 验证字符串类型字段
      expect(typeof data.name).to.equal('string');
      
      // 验证数组类型字段
      expect(Array.isArray(data.photoUrls)).to.be.true;
      
      // 验证枚举字段
      if (data.status) {
        expect(['available', 'pending', 'sold']).to.include(data.status);
      }
      
      console.log('✅ 字段类型验证通过');
    });

    it('应该验证嵌套对象和数组的结构完整性', async () => {
      const response = await axios.get(`${BASE_URL}/v2/pet/findByStatus?status=available`);
      const data = response.data;
      
      // 验证返回的是数组
      expect(data).to.be.an('array');
      
      if (data.length > 0) {
        // 验证每个宠物对象的必要字段
        data.forEach((pet: any, index: number) => {
          expect(pet).to.have.property('id');
          expect(pet).to.have.property('name');
          
          // 如果有分类对象，验证其结构
          if (pet.category) {
            expect(pet.category).to.be.an('object');
            expect(pet.category).to.have.property('id');
            expect(pet.category).to.have.property('name');
          }
          
          // 如果有标签数组，验证其结构
          if (pet.tags && Array.isArray(pet.tags)) {
            pet.tags.forEach((tag: any, tagIndex: number) => {
              expect(tag).to.have.property('id');
              expect(tag).to.have.property('name');
            });
          }
        });
      }
      
      console.log('✅ 嵌套结构验证通过');
    });
  });

  describe('API响应一致性验证', () => {
    it('应该验证多次调用同一接口返回相同的字段结构', async () => {
      const responses: any[] = [];
      
      // 调用同一接口3次
      for (let i = 0; i < 3; i++) {
        const response = await axios.get(`${BASE_URL}/v2/pet/1`);
        responses.push(response.data);
      }
      
      // 验证所有响应都有相同的必需字段
      responses.forEach((response, index) => {
        expect(response).to.have.property('id');
        expect(response).to.have.property('name');
        expect(response).to.have.property('photoUrls');
        
        // 验证字段一致性
        const dataKeys = Object.keys(response);
        expect(dataKeys).to.include.members(['id', 'name', 'photoUrls']);
      });
      
      console.log('✅ 接口响应一致性验证通过');
    });
  });
});