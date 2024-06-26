import { useCallback, useEffect, useRef } from 'react'
import produce from 'immer'
import { BlockEnum, VarType } from '../../types'
import type { Memory, ValueSelector, Var } from '../../types'
import {
  useIsChatMode, useNodesReadOnly,
  useWorkflow,
} from '../../hooks'
import { useStore } from '../../store'
import type { QuestionClassifierNodeType } from './types'
import useNodeCrud from '@/app/components/workflow/nodes/_base/hooks/use-node-crud'
import useOneStepRun from '@/app/components/workflow/nodes/_base/hooks/use-one-step-run'
import { useModelListAndDefaultModelAndCurrentProviderAndModel } from '@/app/components/header/account-setting/model-provider-page/hooks'

const useConfig = (id: string, payload: QuestionClassifierNodeType) => {
  const { nodesReadOnly: readOnly } = useNodesReadOnly()
  const isChatMode = useIsChatMode()
  const defaultConfig = useStore(s => s.nodesDefaultConfigs)[payload.type]
  const { getBeforeNodesInSameBranch } = useWorkflow()
  const startNode = getBeforeNodesInSameBranch(id).find(node => node.data.type === BlockEnum.Start)
  const startNodeId = startNode?.id
  const { inputs, setInputs } = useNodeCrud<QuestionClassifierNodeType>(id, payload)
  const inputRef = useRef(inputs)
  useEffect(() => {
    inputRef.current = inputs
  }, [inputs])

  // model
  const {
    currentProvider,
    currentModel,
  } = useModelListAndDefaultModelAndCurrentProviderAndModel(1)

  const model = inputs.model
  const modelMode = inputs.model?.mode
  const isChatModel = modelMode === 'chat'

  const handleModelChanged = useCallback((model: { provider: string; modelId: string; mode?: string }) => {
    const newInputs = produce(inputRef.current, (draft) => {
      draft.model.provider = model.provider
      draft.model.name = model.modelId
      draft.model.mode = model.mode!
    })
    setInputs(newInputs)
  }, [setInputs])

  useEffect(() => {
    if (currentProvider?.provider && currentModel?.model && !model.provider) {
      handleModelChanged({
        provider: currentProvider?.provider,
        modelId: currentModel?.model,
        mode: currentModel?.model_properties?.mode as string,
      })
    }
  }, [model.provider, currentProvider, currentModel, handleModelChanged])

  const handleCompletionParamsChange = useCallback((newParams: Record<string, any>) => {
    const newInputs = produce(inputs, (draft) => {
      draft.model.completion_params = newParams
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleQueryVarChange = useCallback((newVar: ValueSelector | string) => {
    const newInputs = produce(inputs, (draft) => {
      draft.query_variable_selector = newVar as ValueSelector
    })
    setInputs(newInputs)
    // console.log(newInputs.query_variable_selector)
  }, [inputs, setInputs])

  useEffect(() => {
    const isReady = defaultConfig && Object.keys(defaultConfig).length > 0
    if (isReady) {
      let query_variable_selector: ValueSelector = []
      if (isChatMode && inputs.query_variable_selector.length === 0 && startNodeId)
        query_variable_selector = [startNodeId, 'sys.query']
      setInputs({
        ...inputs,
        ...defaultConfig,
        query_variable_selector: inputs.query_variable_selector.length > 0 ? inputs.query_variable_selector : query_variable_selector,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultConfig])

  const handleClassesChange = useCallback((newClasses: any) => {
    const newInputs = produce(inputs, (draft) => {
      draft.classes = newClasses
      draft._targetBranches = newClasses
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleInstructionChange = useCallback((instruction: string) => {
    const newInputs = produce(inputs, (draft) => {
      draft.instruction = instruction
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  const handleMemoryChange = useCallback((memory?: Memory) => {
    const newInputs = produce(inputs, (draft) => {
      draft.memory = memory
    })
    setInputs(newInputs)
  }, [inputs, setInputs])

  // single run
  const {
    isShowSingleRun,
    hideSingleRun,
    runningStatus,
    handleRun,
    handleStop,
    runInputData,
    setRunInputData,
    runResult,
  } = useOneStepRun<QuestionClassifierNodeType>({
    id,
    data: inputs,
    defaultRunInputData: {
      query: '',
    },
  })

  const query = runInputData.query
  const setQuery = useCallback((newQuery: string) => {
    setRunInputData({
      ...runInputData,
      query: newQuery,
    })
  }, [runInputData, setRunInputData])

  const filterVar = useCallback((varPayload: Var) => {
    return varPayload.type === VarType.string
  }, [])

  return {
    readOnly,
    inputs,
    handleModelChanged,
    isChatMode,
    isChatModel,
    handleCompletionParamsChange,
    handleQueryVarChange,
    filterVar,
    handleTopicsChange: handleClassesChange,
    handleInstructionChange,
    handleMemoryChange,
    isShowSingleRun,
    hideSingleRun,
    runningStatus,
    handleRun,
    handleStop,
    query,
    setQuery,
    runResult,
  }
}

export default useConfig
